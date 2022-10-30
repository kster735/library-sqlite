import express from 'express'
import BookList from './models/BookList.js'
import { body, validationResult } from 'express-validator'


const router = express.Router()

router.get('/', (req, res) => {
    res.render('home')
})

router.get('/books', isLooggedIn, showBookList)

router.post('/books',
    (req, res, next) => {
        req.session.username = req.body['username']
        const bookList = new BookList(req.session.username)
        next()
    },
    showBookList
)

router.get('/addbookform', isLooggedIn, (req, res) => {
    res.render('form', { username: req.session.username })
})

router.post(
    '/doaddbook',
    isLooggedIn,
    body("newTitle")
        .isAlpha('el-GR', { ignore: ' ' })
        .trim()
        .escape()
        .withMessage('Ο τίτλος πρέπει να είναι στα Ελληνικά.')
        .isLength({ min: 1 })
        .withMessage('Τουλάχιστο 1 γράμματα'),
    async (req, res) => {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            const newBook = {
                title: req.body["newTitle"],
                author: req.body["newAuthor"]
            }
            const bookList = new BookList(req.session.username)
            await bookList.loadBooks()
            await bookList.addBook(newBook)
            res.redirect('/books')
        } else {
            console.log('Some Error happend');
            res.render('form', {
                "message": errors.mapped(),
                "title": req.body["newTitle"],
                "author": req.body["newAuthor"]
            })
        }
    })

router.post('/deletebook', isLooggedIn, async (req, res) => {
    const bookList = new BookList(req.session.username)
    await bookList.loadBooks()
    await bookList.deleteBook(req.body["title"])
    res.redirect('/books')
})

router.get('/logout', isLooggedIn, (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

router.get('/about', (req, res) => {
    res.render('about', { username: req.session.username })
})

async function showBookList(req, res) {
    const bookList = new BookList(req.session.username)
    await bookList.loadBooks()    
        
    res.render(
        'books',
        {
            books: bookList.myBooks,
            size: bookList.myBooks.length,
            username: req.session.username
        })
}

async function isLooggedIn(req, res, next) {
    if (req.session.username) {
        next()
    } else {
        res.redirect('/')
    }
}

export { router }