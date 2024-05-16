import "./mongoose.js"
import express from 'express';
import cors from 'cors'
import tasksRouter from "./routers/tasks-router.js";
import usersRouter from "../src/routers/users-routing.js";

const app = express()
const port = process.env.PORT || 3000

app.use(cors());
app.use(express.json())
app.use(tasksRouter)
app.use(usersRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})