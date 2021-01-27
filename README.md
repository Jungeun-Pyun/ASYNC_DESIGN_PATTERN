# ASYNC_DESIGN_PATTERN
## Authored by Jungeun Pyun
### Authored on 2021. Jan. 27.


코드를 작성하다보면 반복되는 동작이 많다. 불필요한 반복을 제거하기 위해 자주 사용되는 동작을 하나의 함수로 저장해두고 필요할 때마다 가져와서 쓸 수 있다. 또한 이렇게 반복적으로 사용되는 함수들을 종류별로 파일에 정리한다. 이것을 **모듈화** 라고 한다.

> Database 상태변화(CRUD) 코드를 모듈화 해보자

반복되는 함수는 크게 4가지로 나눌 수 있다.

1.  beginTransaction
2.  query
3.  commit
4.  rollback

이렇게 4개의 함수를 components라는 폴더를 생성하여 db.js라는 파일안에 만들었다.
beginTransaction 내에서 getConnection으로 pool의 연결을 받아오기 때문에 db 파일 안에 createPool을 포함시켰다.
또한 기본적으로 beginTransaction과 그 안에서 돌아가는 query문, commit, rollback은 절차적으로 진행되야 한다. 따라서 promise와 async & await를 이용하여 비동기 제어 로직을 만들었다.

1. beginTransaction

beginTransaction이란 함수를 하나 만들고 불러쓸 수 있도록 module.exports를 한다. 그리고 Promise 객체를 return 하면서 연결됐을 때 connection을 반환해준다.

<pre><code>
module.exports.beginTransaction = () => { 
    return new Promise((resolve, reject) => { 
        pool.getConnection(function(err, connection){ 
            if (err) reject(err) 
            connection.beginTransaction(function(err){ 
                if (err) reject(err)
            resolve(connection)
            })
        })
    })
}
</code></pre>

2. query

쿼리문은 매개변수로 db와의 connection과 사용할 query, 그리고 client에서 보내준 value 값 이렇게 3가지가 필요하다. 따라서 아래의 options 객체로 받아와야 할 것이다. 

<pre><code>
module.exports.query = (options) => {
    return new Promise((resolve, reject) => {
        const connection = options.connection 
        const query = options.query
        const values = options.values

        connection.query( 
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
</code></pre>

3. rollback

동작중에 에러가 발생했을 때 해당 동작을 무효화하고 에러가 없을 경우 결과값을 주면서 연결을 반환한다.

<pre><code>
module.exports.rollback = (connection) => {
    return new Promise((resolve, reject) => {
        connection.rollback(err => {
            if (err) {
                reject (err)
            } else {
                resolve()
                connection.release()
            }
        })
    })
}
</code></pre>

4. commit

transaction의 종료 의미로 실제 동작을 수행하는 commit이다. 같은 파일 안에서 선언한 함수는 this를 붙여서 사용할 수 있다.

<pre><code>
module.exports.commit = (connection) => {
    return new Promise((resolve, reject) => {
        connection.commit(err => { 
            if (err) {
                reject(this.rollback(connection)) 
            } else {
                resolve()
                connection.release()
            }
        })
    })
}
</code></pre>

* * *

이제 위 함수들을 가지고 goods.js 파일 내의 method를 수정할 수 있다. 하지만 한가지 더 모듈화할 수 있는것이 있는데 바로 query문이다.

1. SELECT
2. INSERT
3. UPDATE
4. DELETE

4가지 쿼리문을 models 폴더의 goods.js 파일에 다시 한번 모듈화 하였다. db 파일에서 만들어준 query함수를 이 때 사용할 수 있다. promise 객체의 결과값을 사용하기 위해서 async와 await를 붙여주었다.

1. SELECT

promise결과값이 들어가는 함수 앞에 async를 붙여주고 promise 객체 앞에 await를 붙여주었다. 또한 query 함수를 만들 때 언급한 것 처럼 매개변수를 객체화해서 입력한다.

<pre><code>
module.exports.getList = async (connection, options) => {
    console.log("options : ", options)
    const {idx} = options
    let query = 'SELECT * FROM Goods '
    let values
    if (idx) { 
        query += 'WHERE idx = ?'
        values = idx
    }
    const result=await db.query({ 
        connection:connection,
        query:query,
        values:values
    })
    return result
} 
</code></pre>

2. INSERT & UPDATE & DELETE

나머지 쿼리문 역시 같은 방식으로 모듈화 할 수 있다.

* * *

이제 이렇게 만들어준 모듈들을 goods.js에서 사용할 수 있다. 이때 try catch 문이 필요하다. try{} 안에서 동작하는 함수들에 에러가 발생한다면 catch{} 안에서 해당 에러를 핸들링 하는 형태인데 본 코드에선 아직 에러를 핸들링하는게 없기 때문에 next(err)로 넘겨주겠다.

내용을 모두 모듈화하면 post method가 아래와 같이 짧아지는 것을 볼 수 있다. 

<pre><code>
router.post('/', async function(req, res, next) {
    const body = req.body
    const connection = await db.beginTransaction()
    try {
        const result = await model.insert(connection, body)
        await db.commit(connection)
        res.status(200).json({result})
    } catch (err){
        next(err)
    }
})
</code></pre>

나머지 put, delete, get도 같은 형식으로 축소하였고 get에서는 사실상 beginTransaction 자체가 필요하지 않기 때문에 getConnection이라는 모듈을 추가로 만들어서 사용하였다.