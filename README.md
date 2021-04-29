# ASYNC_DESIGN_PATTERN
## Authored by Jungeun Pyun

### 📌  비동기 처리

Javascript는 기본적으로 비동기 (Non-Blocking) 프로그래밍이다.

비동기 시스템이란, 동작이 스크립트가 작성된 순서대로 진행되는 것이 아니라 결과값이 먼저 나오는 순서대로 진행되는 것이다. 비동기 시스템은 주로 퍼포먼스가 극대화되어야 하는 웹/앱에서 많이 사용된다.

#### 1\. Non-Blocking 

```javascript
fs.readFile('./file.md', (err, data) => {
    if (err) throw err;
    console.log('non blocking data : ',data);
});

console.log('wow')

//result
//wow
//non blocking data :  <Buffer 61 73 64 66 73 64 66>
```

스크립트가 작성된 절차대로 수행된다면 데이터가 먼저 출력되고 wow가 출력되겠지만, 비동기 방식은 그렇지 않다. console창에 wow를 출력하는 시간보다 데이터를 읽어오는 시간이 더 걸리기 때문에 위와 같은 결과가 나온다.

#### 2\. Callback

하지만, 스크립트를 작성하다보면 절차대로 진행되어야 하는 동작들이 생긴다. 이때 사용할 수 있는 방법 하나가 callback 함수이다. callback함수는 함수 안에서 실행되는 함수이다.

```javascript
function sumFunction(num1, num2, callback){
    let result = num1+num2
    if('number' == typeof(result)){
        let error
        let message = result
        callback(error, message)
    } else {
        let error = 'is Not Number : ', result
        let message 
        callback(error, message)
    }
}


sumFunction(1, "abcd", 
    function(error, message){ // callback 함수
        console.log("error : ",error)
        console.log("message : ",message)
    }
)

//result
//error :  is Not Number : 
//message :  undefined
```

위의 예제에서 sumFunction을 만들 때 callback함수가 실행될 부분에 'callback'을 넣어준다. 실제로 함수를 실행시킬 때 callback함수의 내용을 입력해주면 해당 callback 함수가 실행되어야 할 때에 동작한다.

#### 3\. Callback Hell

위와 같이 callback 함수를 사용해서 스크립트를 작성하다보면 callback 안에 callback을 넣고 또 그 안에 callback을 넣는 callback hell에 빠지게 된다.

```javascript
setTimeout(() => {
    console.log('sleep 2')
}, 3000);
setTimeout(() => {
    console.log('wake up! 1')
}, 1000);
console.log('eat 0');


setTimeout(() => {
    console.log('sleep')
     setTimeout(() => {
        console.log('wake up!')        
        setTimeout(() => {            
            console.log('eat');
        }, 1000);    
    }, 1000);    
}, 1000);
```

이때 Arrow function : () => 은 함수를 선언해주는 function()과 같다. 위와 같은 callback hell은 스크립트를 파악하기 쉽지 않다.

#### 4\. Promise 객체

Promise 객체를 활용해서 더욱 직관적으로 Non Blocking 코드를 제어할 수 있다. Promise가 비동기 코드를 제어할 수 있는 건 3가지 상태를 가지고 있기 때문이다. 3가지 상태는 다음과 같다.

-   Pending(대기) : 이행되거나 거부되지 않은 초기 상태
-   Fulfilled(이행) : 연산이 성공적으로 완료됨
-   Rejected(실패) : 연산이 실패함

이제 위 3가지 상태를 어떻게 활용하는지 알아보자. 제목에서 말한 것처럼 Promise는 객체이기 때문에 사용할 때 new를 이용해서 인스턴스화 하면서 선언해준다. 여기서 Promise가 가지고 있는 2개의 콜백 함수 매개변수가 있다. 바로 resolve와 reject이다.

-   Promise.resolve(value) : 이행된 promise값을 반환한다. (Fulfilled 상태)
-   Promise.reject(reason) : 거부된 promise를 반환한다. 디버깅용으로 에러를 체크하기 위해 사용한다. (Rejected 상태)

#### 5\. async & await

동기화를 시켜주기 위해 Promise와 함께 사용하는 것이 async와 await이다. 말 그대로 (async) 비동기를 (await) 기다린다는 의미이다. 사용 방법은 다음과 같다.

1.  Promise의 결과값을 받아와서 사용해야 하는 함수 앞에 async를 입력한다.
2.  Promise에서 반환되는 값 앞에 await를 입력한다.

```javascript
  function promise(){    
    return new Promise((resolve, reject) => {
        setTimeout(function(){
          resolve("Success!");
        }, 250);
      });    
  }

  async function promisetest(){
      console.log('Test-Promise ' + await promise())
  }

  promisetest()
  
  //result
  //Test-Promise Success!
```

이때, 인스턴스화 한 Promise앞에 return을 붙여주는 이유는 promise()의 반환 값으로 resolve값을 내보내기 위해서다.

```javascript
let myFirstPromise = new Promise((resolve, reject) => {
    setTimeout(function(){
      resolve("Success!"); // Yay! Everything went well!
    }, 250);
  });

  console.log('myFirstPromise : ',myFirstPromise)
  
  //result
  //myFirstPromise :  Promise { <pending> }
```

위와 같이 return값을 반환하지 않고 선언만 해준 Promise의 결과는 Promise 그 자체이다. 실제로 사용하고자 하는 promise의 resolve 또는 reject값을 얻기 위해서는 return을 사용하여 값을 반환해주는 것이 편리하다.       
         
**블로그링크** : <https://jungeunpyun.tistory.com/22>

<br></br>
***

### 📌  모듈화

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

#### 1\. beginTransaction

beginTransaction이란 함수를 하나 만들고 불러쓸 수 있도록 module.exports를 한다. 그리고 Promise 객체를 return 하면서 연결됐을 때 connection을 반환해준다.

```javascript
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
```

#### 2\. query

쿼리문은 매개변수로 db와의 connection과 사용할 query, 그리고 client에서 보내준 value 값 이렇게 3가지가 필요하다. 따라서 아래의 options 객체로 받아와야 할 것이다. 

```javascript
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
```

#### 3\. rollback

동작중에 에러가 발생했을 때 해당 동작을 무효화하고 에러가 없을 경우 결과값을 주면서 연결을 반환한다.

```javascript
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
```

#### 4\. commit

transaction의 종료 의미로 실제 동작을 수행하는 commit이다. 같은 파일 안에서 선언한 함수는 this를 붙여서 사용할 수 있다.

```javascript
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
```

* * *

이제 위 함수들을 가지고 goods.js 파일 내의 method를 수정할 수 있다. 하지만 한가지 더 모듈화할 수 있는것이 있는데 바로 query문이다.

1. SELECT
2. INSERT
3. UPDATE
4. DELETE

4가지 쿼리문을 models 폴더의 goods.js 파일에 다시 한번 모듈화 하였다. db 파일에서 만들어준 query함수를 이 때 사용할 수 있다. promise 객체의 결과값을 사용하기 위해서 async와 await를 붙여주었다.

#### 1\. SELECT

promise결과값이 들어가는 함수 앞에 async를 붙여주고 promise 객체 앞에 await를 붙여주었다. 또한 query 함수를 만들 때 언급한 것 처럼 매개변수를 객체화해서 입력한다.

```javascript
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
```

#### 2\. INSERT & UPDATE & DELETE

나머지 쿼리문 역시 같은 방식으로 모듈화 할 수 있다.

* * *

이제 이렇게 만들어준 모듈들을 goods.js에서 사용할 수 있다. 이때 try catch 문이 필요하다. try{} 안에서 동작하는 함수들에 에러가 발생한다면 catch{} 안에서 해당 에러를 핸들링 하는 형태인데 본 코드에선 아직 에러를 핸들링하는게 없기 때문에 next(err)로 넘겨주겠다.

내용을 모두 모듈화하면 post method가 아래와 같이 짧아지는 것을 볼 수 있다. 

```javascript
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
```

나머지 put, delete, get도 같은 형식으로 축소하였고 get에서는 사실상 beginTransaction 자체가 필요하지 않기 때문에 getConnection이라는 모듈을 추가로 만들어서 사용하였다.        
           
**블로그링크** : <https://jungeunpyun.tistory.com/24>