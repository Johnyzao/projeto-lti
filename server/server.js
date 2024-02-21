const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Teste");
});

<<<<<<< HEAD
app.listen(3000, () => {console.log("Teste")});
=======
app.listen(3000, () => {console.log("Teste")});
>>>>>>> 59260421d08e90069730e62a6b88b07f90c7e599
