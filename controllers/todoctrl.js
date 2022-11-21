const User = require('../models/User')
const toDos = require('../models/WantToDos')

createtoDo = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a todo',
        })
    }

    const toDo = new toDos(body)

    if (!toDo) {
        return res.status(400).json({ success: false, error: err })
    }

    toDo
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: toDo._id,
                message: 'todo created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'todo not created!',
            })
        })
}

deletetoDo = async (req, res) => {
    await toDos.findOneAndDelete({ _id: req.params.id }, (err, toDo) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!toDo) {
            return res
                .status(404)
                .json({ success: false, error: `toDo not found` })
        }

        return res.status(200).json({ success: true, data: toDo })
    }).catch(err => console.log(err))
}

gettoDoById = async (req, res) => {
    await toDos.findOne({ _id: req.params.id }, (err, toDo) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!toDo) {
            return res
                .status(404)
                .json({ success: false, error: `toDo not found` })
        }
        return res.status(200).json({ success: true, data: toDo })
    }).catch(err => console.log(err))
}

gettoDos = async (req, res) => {
    await toDos.find({}, (err, alltoDos) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!alltoDos.length) {
            return res
                .status(404)
                .json({ success: false, error: `toDo not found` })
        }
        return res.status(200).json({ success: true, data: alltoDos })
    }).catch(err => console.log(err))
}

module.exports = {
    createtoDo,
    deletetoDo,
    gettoDoById,
    gettoDos,
    getMovieById,
}

//maybe add update to-do? to comfirm that its done, but that could also just be delete when finished?