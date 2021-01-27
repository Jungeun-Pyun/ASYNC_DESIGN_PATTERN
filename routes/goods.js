var express = require('express');
var router = express.Router();
const db = require('../components/db')
const model = require('../models/goods')

router.post('/', async function(req, res, next) {
    const body = req.body
    // console.log('body : ', body)
    const connection = await db.beginTransaction() //await이 있으면 무조건 async 들어가야함
    try {
        const result = await model.insert(connection, body)
        await db.commit(connection)
        res.status(200).json({result})
    } catch (err){
        next(err) // 에러가 있더라도 다른 명령어를 호출해야 함
    }
})
    // res.json({body})



  router.put('/', async function(req, res, next) {
    const body = req.body
    // console.log('body : ', body)
    const connection = await db.beginTransaction()
    try {
        const result = await model.update(connection, body)
        await db.commit(connection)
        res.status(200).json({result})
    } catch (err){
        next(err) // 에러가 있더라도 다른 명령어를 호출해야 함
    }
});

  router.delete('/', async function(req, res, next) {
    const body = req.body
    // console.log('body : ', body)
    const connection = await db.beginTransaction()
    try {
        const result = await model.delete(connection, body)
        await db.commit(connection)
        res.status(200).json({result})
    } catch (err){
        next(err) // 에러가 있더라도 다른 명령어를 호출해야 함
    }
  });

/* GET home page. */
router.get('/', async function(req, res, next) {
    // const {idx} = req.query //localhost:3000/goods?idx=4
    const body = req.body
    const connection = await db.getConnection()
    const result = await model.getList(connection, body) //get은 connection이 필요없음
    res.status(200).json({result})
});

module.exports = router;