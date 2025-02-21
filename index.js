require('./src/mongoose.js');
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./src/routers/tasks-router.js');
const usersRouter = require('./src/routers/users-routing.js');

const app = express()
const port = process.env.PORT || 3000

app.use(cors());
app.use(express.json())
app.use(tasksRouter)
app.use(usersRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
