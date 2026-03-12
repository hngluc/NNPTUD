var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users')

// GET all
router.get('/', async function (req, res, next) {
    try {
        let data = await userModel.find({
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({
            isDeleted: false,
            _id: id
        }).populate({
            path: 'role',
            select: 'name'
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "User not found"
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
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            status: req.body.status,
            role: req.body.role,
            loginCount: req.body.loginCount || 0
        })
        await newUser.save()
        res.status(201).send(newUser)
    } catch (error) {
         res.status(400).send({ message: error.message });
    }
})

// UPDATE 
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await userModel.findOneAndUpdate(
            { _id: id, isDeleted: false }, 
            req.body, 
            { new: true }
        )
        if (result) {
           res.send(result)
        } else {
           res.status(404).send({ message: "User not found" });
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
        let result = await userModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true
            await result.save();
            res.send(result)
        } else {
            res.status(404).send({
                message: "User not found"
            })
        }
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
})

// ENABLE USER
router.post('/enable', async function (req, res) {
    try {
        let { username, email } = req.body;
        
        let user = await userModel.findOne({
            username: username,
            email: email,
            isDeleted: false
        });

        if (user) {
            user.status = true;
            await user.save();
            res.send({
                message: "User enabled successfully",
                user: user
            });
        } else {
            res.status(404).send({
                message: "User not found or credentials do not match"
            });
        }
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

// DISABLE USER
router.post('/disable', async function (req, res) {
    try {
        let { username, email } = req.body;
        
        let user = await userModel.findOne({
            username: username,
            email: email,
            isDeleted: false
        });

        if (user) {
            user.status = false;
            await user.save();
            res.send({
                message: "User disabled successfully",
                user: user
            });
        } else {
            res.status(404).send({
                message: "User not found or credentials do not match"
            });
        }
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

module.exports = router;
