// 중복코드 해소를 위한 모듈화
// 콜백지옥을 벗어나기 위함

const config = require('../config') //파일명이 index.js면 폴더 뒤에 파일명 따로 지정해주지 않아도 index.js가져옴
const mysql = require('mysql');
const { json, query } = require('express');

const pool = mysql.createPool({ //connection 재활용 - config에 파일 만들어서 가져와서 씀
    connectionLimit : config.database.connectionLimit,
    host : config.database.host,
    user : config.database.user,
    password : config.database.password,
    database : config.database.database
})


module.exports.beginTransaction = () => { //post, put, delete할 때 무조건 getconnection을 해야하기 때문에 필수로 필요한 코드, 쿼리문은 제외함
    return new Promise((resolve, reject) => { //promise에서 처리할 것은 resolve, reject 두가지
        pool.getConnection(function(err, connection){ //콜백함수가 error와 쿼리를 돌릴 connection을 같이 줌
            if (err) reject(err) //에러는 모두 reject로 감싸줌
            connection.beginTransaction(function(err){ // 먼저 실행시켜서 이 안에 rollback, commit이 들어가야 함, callback 함수 안에는 순차적으로 진행되어야 하는 함수들이 들어간다
                if (err) reject(err)//{}유무는 상관 없음
            resolve(connection)
            })
        })
    })
}

//get 사용할 때는 begintransition을 쓸필요가 없음
module.exports.getConnection = () => { //post, put, delete할 때 무조건 getconnection을 해야하기 때문에 필수로 필요한 코드, 쿼리문은 제외함
    return new Promise((resolve, reject) => { //promise에서 처리할 것은 resolve, reject 두가지
        pool.getConnection(function(err, connection){ //콜백함수가 error와 쿼리를 돌릴 connection을 같이 줌
            if (err) reject(err) //에러는 모두 reject로 감싸줌
            resolve(connection)
        })
    })
}

// let params = {connection:"daaa", query:"sfsf"}
// query(params)

module.exports.query = (options) => {
    return new Promise((resolve, reject) => {
        // connection, sql query문 : 변수, value : 변수
        const connection = options.connection //options에 객체가 들어와야 한다는 의미
        const query = options.query
        const values = options.values

        connection.query( //SET 하면 sql에서 알맞은 column을 찾아서 알아서 들어감
            query,
            values,
            function (error, result, fields){
                if (error) {
                    reject (error)
                }
                resolve(result)
            }
        )
    })
}

module.exports.commit = (connection) => {
    return new Promise((resolve, reject) => {
        connection.commit(err => { //실질적으로 쿼리문을 실행시키는 명령어, commit이 실행되기 전에 위의 insert가 실행되지 않음
            if (err) {
                reject(this.rollback(connection)) //같은 파일안에 있는 함수를 불러올 때 this 사용함
            } else {
                // connection.release()
                resolve()
                connection.release()
            }
        })
    })
}

module.exports.rollback = (connection) => {
    return new Promise((resolve, reject) => {
        connection.rollback(err => {
            if (err) {
                reject (err)
            } else {
                // connection.release()
                resolve()
                connection.release()
            }
        })
    })
}