// 쿼리편집 목적 파일

const db = require('../components/db')


module.exports.getList = async (connection, options) => {
    console.log("options : ", options)
    const {idx} = options
    let query = 'SELECT * FROM Goods '
    let values
    if (idx) { //WHERE 조건문 추가
        query += 'WHERE idx = ?'
        values = idx
    }
    const result=await db.query({ //매개변수에 
        connection:connection,
        query:query,
        values:values
    })
    return result
} 


module.exports.insert = async (connection, options) => {
    console.log("options : ", options)
    // const {idx} = options
    let query = 'INSERT INTO Goods SET ? '
    let values = options
    // if (idx) { //WHERE 조건문 추가
    //     query += 'WHERE idx = ?'
    //     values = idx
    // }
    const result=await db.query({ //매개변수에 
        connection:connection,
        query:query,
        values:values
    })
} 

module.exports.update = async (connection, options) => {
    console.log("options : ", options)
    const {idx} = options
    const newGood = {name : options.name, price: options.price}
    let query = 'UPDATE Goods SET ? WHERE idx = ? '
    let values = [newGood, idx]
    const result=await db.query({ //매개변수에 
        connection:connection,
        query:query,
        values:values
    })
    
} 

module.exports.delete = async (connection, options) => {
    console.log("options : ", options)
    const {idx} = options
    let query = 'DELETE FROM Goods WHERE idx= ?'
    let values = idx
    const result=await db.query({ //매개변수에 
        connection:connection,
        query:query,
        values:values
    })
    
} 

//client가 요청하고 서버가 반응하는 속도보다 database를 읽는 속도가 더 느리면 값이 제대로 출력이 되지 않음
// 그래서 비동기 흐름을 제어할 때 promise를 사용함

//promise를 사용하면, 적용 함수에선 await를 사용해서 기다려줘야함
