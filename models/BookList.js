import { Sequelize, DataTypes } from "sequelize"

const db_books = './db_books/books.sqlite'

const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    define: {
        timestamps: false
    },
    storage: db_books
})


// Ορισμός Μοντέλου
const Book = sequelize.define('Book', {
    title: {
        type: DataTypes.TEXT,
        primaryKey: true,
        unique: true
    },
    author: {
        type: DataTypes.TEXT,
        allowNull: false
    },
})

const User = sequelize.define('User', {
    name: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    password: {
        type: DataTypes.TEXT,
    },
})

const BookUser = sequelize.define('BookUser', {
    comment: {
        type: DataTypes.TEXT
    }
})

Book.belongsToMany(User, { through: BookUser })
User.belongsToMany(Book, { through: BookUser })

await sequelize.sync({ alert: true })


class BookList {
    myBooks = []

    constructor(username) {
        if (username == undefined)
            throw new Error("Δεν έχει ορισθεί χρήστης!")
        this.username = username
    }

    async loadBooks() {
        try {
            await this.findOrAddUser()
            this.myBooks = await this.user.getBooks({ raw: true })
        } catch (error) {
            throw error
        }
    }

    async addBook(newBook) {
        try {
            await this.findOrAddUser()
            let book = await Book.findOne({where: {title: newBook.title}})
            if (!book){
                book = await Book.create({
                    title: newBook.title.toString(),
                    author: newBook.author.toString()
                })
            }
            await this.user.addBook(book)
        } catch (error) {
            throw new Error(error.errors[0].message)
        }
    }

    async deleteBook(bookTitle) {
        try {
            // Υπάρχει ο χρήστης;
            await this.findOrAddUser()
            // Υπάρχει το βιβλίο;
            const bookToDelete = await Book.findOne({where: {title: bookTitle}})
            // Εάν υπάρχει το βιβλίο διέγραψέ το από τον Πίνακα UserBook
            // για το συγκεκριμένο χρήστη
            await bookToDelete.removeUser(this.user)
            // Εάν το βιβλίο δεν ανήκει πλέον σε κανένα χρήστη διέγραψέ το και από τον 
            // πίνακα Book
            const numberOfUsers = await bookToDelete.countUsers()
            if (numberOfUsers == 0) {
                await Book.destroy({where: {title: bookTitle}})
            }
        } catch (error) {
            throw error
        }
    }

    async findOrAddUser() {
        if (this.user == undefined) {
            try {
                const [user, created] = await User.findOrCreate({ where: {name: this.username}}) 
                this.user = user
            } catch (error) {
                throw error
            }
        }
    }
}

export default BookList