import mongoose from 'mongoose';
import Task from "./src/model/task.js"

mongoose.connect('mongodb://localhost:27017/task-manager').then(() => {
    console.log("Connected Successfully!");
}).catch((err) => {
    console.log(err);
})

const deleteAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({ completed: false });

    return count;
}
deleteAndCount('6631bded246d4c3b364435d4').then(count => {
    console.log(count);
}).catch(e => {
    console.log(e);
})
