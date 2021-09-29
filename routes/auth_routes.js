//! creating express router
const express = require('express');
const router = express.Router();



//! importing controllers
const authController = require('../controllers/auth_controller');


router.get('/', (req, res, next) => {
    res.send('Welcome to the Auth end point');
})

router.get('/all', authController.getAll)
router.get('/all/:id', authController.getById)

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/update/:id', authController.updateById)


router.post('/verify', authController.verifyOtp)
router.post('/resend', authController.resendOtp)



// router.post('/update-address/:id', authController.updateAddressById)

router.post('/delete/:id', authController.deleteById)




module.exports = router;