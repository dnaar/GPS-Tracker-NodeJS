const express = require('express');
const app = express();

app.listen(80);
app.use(express.static('MyWebApp'));
