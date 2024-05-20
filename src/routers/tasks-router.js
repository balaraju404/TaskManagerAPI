import express from "express";
import Task from '../model/task.js';
import auth from "../middleware/auth.js";
import User from "../model/user.js";

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    // match.bin = false;
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortedBy) {
        const parts = req.query.sortedBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const skip = (page - 1) * limit
    try {
        const userWithTasks = await User.findById(req.user._id).populate({
            path: 'tasks',
            match,
            options: {
                limit: limit || 10,
                skip: skip > 0 ? skip : 0,
                sort
            }
        }).lean()
        if (!userWithTasks.tasks || userWithTasks.tasks.length === 0) {
            return res.status(404).send({ error: "No tasks found" });
        }
        res.status(200).send(userWithTasks.tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});


router.get('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id;
    try {
        const task = await Task.findOne({ _id: id, owner: req.user._id }).lean()
        if (!task) {
            res.status(404).send({ error: 'No record found' })
        }
        else {
            res.status(202).send(task)
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id }).lean();

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Add logging here to check the value of task
        console.log('Found task:', task);

        const updates = Object.keys(req.body);
        const allowedUpdates = ['description', 'completed', 'deleted'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        updates.forEach(update => task[update] = req.body[update]);
        await Task.updateOne({ _id: req.params.id, owner: req.user._id }, task);

        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.delete('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id }).lean();

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully', task });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;