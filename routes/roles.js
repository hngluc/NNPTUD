var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles')

// GET all
router.get('/', async function (req, res, next) {
    try {
        let data = await roleModel.find({
            isDeleted: false
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET by id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "Role not found"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});

// CREATE
router.post('/', async function (req, res) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        })
        await newRole.save()
        res.status(201).send(newRole)
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

// UPDATE (Soft delete is UD, but regular update is good too)
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            req.body,
            { new: true }
        )
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({ message: "Role not found" });
        }
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
})

// SOFT DELETE
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true
            await result.save();
            res.send(result)
        } else {
            res.status(404).send({
                message: "Role not found"
            })
        }
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
})

// GET users by role
router.get('/users/:id', async function (req, res, next) {
    try {
        let id = req.params.id;

        // First, check if the role exists
        let roleExists = await roleModel.findOne({
            isDeleted: false,
            _id: id
        });

        if (!roleExists) {
            return res.status(404).send({
                message: "Role not found"
            });
        }

        // We need to require the user model here since it's not at the top of the file
        let userModel = require('../schemas/users');

        let users = await userModel.find({
            role: id,
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name'
        });

        res.send(users);

    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

module.exports = router;
