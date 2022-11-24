require("dotenv").config();
const connection = require("./db");
const express = require('express');
const { server_port }= process.env;
const app = express();


connection.connect((err) => {
    if (err) {
        console.error('error connecting to db' + err)
    } else {
        console.log('connected to db')
    }
});


app.get("/", (req,res) => {
    res.send("Welcome to the main route");
});

// app.get("/products", (req, res) => {
//     res.send("Products route")
// });

const things = [
    { id: 1, name: 'Socks' },
    { id: 2, name: 'Computer' },
    { id: 3, name: 'Passion' },
   ];

let newId = 4;

app.use(express.json());

app.post('/things', (req, res) => {
 const { name } = req.body;
 console.log(req.body)
 const newThing = { id: newId++, name };
 things.push(newThing);
 console.log(name)
 res.status(201).send(newThing);
});


   app.get('/things', (req, res) => {
    res.json(things);
  });
  
   
   app.get('/things/:id', (req, res) => {
    const parsedThingId = parseInt(req.params.id)
    const thing = things.find((thing) => thing.id === parsedThingId);
    if (thing) {
      res.send(thing);
    } else {
      res.sendStatus(404);
    }
       });
   

    app.get("/products", (req, res) => {
        connection
        .promise()
        .query("SELECT * FROM products")
        .then(([results]) => {
            res.json(results);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error retrieving products from db.")
        })
    });
   
    
    app.get("/products/:id", (req, res) => {
        let { id } = req.params;
        connection
        .promise()
        .query("SELECT * FROM products WHERE product_id = ?", [id])
        .then(([results]) => {
            if (!results.length) {
                res.status(404).send({
                    status: "404",
                    msg: "Not found",
                    data: null,
                })
            } else {
                res.json(results);   
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error retrieving products from db.")
        })
    }); 

    app.post("/products", (req, res) => {
        const { title, price } = req.body;
        connection
        .promise()
        .query("INSERT INTO products (title, price) VALUES (?,?)", [title, price])
        .then(([result]) => {
            const createdProduct = { id: result.insertId, title, price};
            res.status(201).json(createdProduct)
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500)
        });
    });

    app.put("/products/:id", (req, res) => {
        connection
        .promise()
        .query("UPDATE products SET ? WHERE product_id = ?", [req.body, req.params.id])
        .then(([result]) => {
            res.sendStatus(200)
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500)
        });
    });


    app.delete("/products/:id", (req, res) => {
        connection
        .promise()
        .query("DELETE FROM products WHERE product_id = ?", [req.params.id])
        .then(([result]) => {
            if (result.affectedRows) {
                res.sendStatus(204)
            } else {
                res.sendStatus(404)                
            }

        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500)
        });
    });
   




app.listen(server_port, (e) => {
    if (e) {
        console.log(e);
    } else {
        console.log('Express server is running', server_port);
    }
});