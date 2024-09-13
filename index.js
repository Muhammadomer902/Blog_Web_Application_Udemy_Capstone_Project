import express from "express"
import bodyParser from "body-parser"
import fs from "fs"
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname=dirname(fileURLToPath(import.meta.url))
const app = express();
const port = 3000;

var BlogsArr = [];

app.set('view engine', 'ejs');

function GetName(req ,res, next){
    const BlogDir = path.join(__dirname, "/views/blogs");
    fs.readdir(BlogDir, (err, files) => {
        const ejsFiles = files.filter(file => path.extname(file) === '.ejs');
        BlogsArr = files.filter(file => path.extname(file) === '.ejs');
        next();
    });
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(GetName);

app.get("/", (req,res) =>{
    res.render("index.ejs", { BlogsArr });
});

app.get("/create-post", (req,res)=>{
    res.render("create-post.ejs")
});

app.get("/edit-post", (req,res)=>{
    res.render("edit-post.ejs")
});

app.get("/delete-post", (req,res)=>{
    res.render("delete-post.ejs")
});

app.get("/blogs/:blogName", (req, res) => {
    const blogName = req.params.blogName;
    const blogFilePath = path.join(__dirname, "views", "blogs", `${blogName}`);
    res.render(`blogs/${blogName}`);
});

app.post("/create-post", (req, res) => {
    const { title, date, content } = req.body;
    const blogPath = path.join(__dirname, 'views', 'blogs', `${title.replace(/\s+/g, '-').toLowerCase()}.ejs`);

    const capitalizeTitle = (str) => {
        return str.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
    };

    const formattedTitle = capitalizeTitle(title);
    const formattedDate = capitalizeTitle(date);

    const blogContent = `
    <%- include("./../partials/header.ejs") %>
    <div class="small-container">
        <h1>${formattedTitle}</h1>
        <h2>${formattedDate}</h2>
        <p>${content.replace(/\n/g, '</p><br><p>')}</p>
    </div>
    <%- include("./../partials/footer.ejs") %>
    `;

    fs.writeFile(blogPath, blogContent, (err) => {
        if (err) {
            console.error('Error creating the blog post:', err);
            return res.status(500).send('Error creating the blog post.');
        }
        res.redirect(`/blogs/${title.replace(/\s+/g, '-').toLowerCase()}`);
    });
});

app.post('/delete-post', (req, res) => {
    const { title } = req.body;

    const filePath = path.join(__dirname, `views/blogs/${title}.ejs`);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting post');
        }
        res.redirect('/');
    });
});

app.post('/edit-post', (req, res) => {
    const { title } = req.body;

    const filePath = path.join(__dirname, `views/blogs/${title}.ejs`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading post');
        }
        res.render('edit-post-content', { title: title, content: data });
    });
});

app.post('/update-post', (req, res) => {
    const { title, content } = req.body;
    const filePath = path.join(__dirname, `views/blogs/${title}.ejs`);

    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating post');
        }
        res.redirect('/');
    });
});

app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
});