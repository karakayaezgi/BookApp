const booksAreaDOM = document.querySelector('.books-area')
const formDOM = document.querySelector('#form')
const addBookModalLabelDOM = document.querySelector('#addBookModalLabel')
const favoritesDOM = document.querySelector('.favorites')
const searchInputDOM = document.querySelector('.search-input')
const searchBtnDOM = document.querySelector('.search-btn')
const sortDOMs = document.querySelectorAll('.sort')
const categoryDOMs = document.querySelectorAll('.category')

let editingBookId = null
let books = []
let currentBooks = []
let searchText = ""
let sortText = ""
let categoryText = ""

formDOM.addEventListener("submit", async (event) => {
    event.preventDefault()

    const bookName = formDOM.bookName.value
    const pageCount = formDOM.pageCount.value
    const imgUrl = formDOM.imgUrl.value.trim() === "" ? "images/default_img.jpg" : formDOM.imgUrl.value.trim()
    const category = formDOM.category.value
    const author = formDOM.author.value
    const subject = formDOM.subject.value


    const book = {
        bookName,
        pageCount,
        imgUrl,
        category,
        author,
        subject
    }
    if (editingBookId == null) {
        const newBook = await addBook(book)
        books.unshift(newBook)
        showBooksUI(books)
    }
    else {
        await updateBook(editingBookId, book)
        editingBookId = null
    }
    formDOM.reset()
})
searchInputDOM.addEventListener('input', (event) => {
    searchText = event.target.value
})

search = () => {
    let filteredBooks = books.filter(book => book.bookName.toLowerCase().includes(searchText.toLowerCase().trim()) ||
        book.author.toLowerCase().includes(searchText.toLowerCase().trim()) || book.category.toLowerCase().includes(searchText.toLowerCase().trim()))
    showBooksUI(filteredBooks)
    searchInputDOM.value = ""

}
searchBtnDOM.addEventListener("click", search)

sort = () => {
    if (!sortText) return
    let sortedBooks = sortText === "A-Z" ? [...currentBooks].sort((a, b) => a.bookName.localeCompare(b.bookName, "tr")) : [...currentBooks].sort((a, b) => b.bookName.localeCompare(a.bookName, "tr"))
    showBooksUI(sortedBooks)
}
sortDOMs.forEach((select) => {
    select.addEventListener("change", (event) => {
        sortText = event.target.value
        sort()
    })
})


updateBook = async (id, book) => {
    await fetch(`http://localhost:3000/books/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(book)
    })
}

deleteBook = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/books/${id}`, {
            method: "DELETE"
        })

        if (!response.ok) {
            throw new Error("Silme başarısız");

        }
        books = books.filter(item => item.id !== id)
        showBooksUI(books)
    }
    catch (error) {
        console.log(error);
    }

}

addBook = async (book) => {

    try {
        const response = await fetch("http://localhost:3000/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(book)
        })
        const data = await response.json()
        return data

    }
    catch (error) {
        console.log(error);

    }
}

editBook = async (id) => {
    const editedToBeBook = currentBooks.filter(item => item.id === id)
    editingBookId = editedToBeBook[0].id

    formDOM.bookName.value = editedToBeBook[0].bookName
    formDOM.pageCount.value = editedToBeBook[0].pageCount
    formDOM.imgUrl.value = editedToBeBook[0].imgUrl
    formDOM.category.value = editedToBeBook[0].category
    formDOM.author.value = editedToBeBook[0].author
    formDOM.subject.value = editedToBeBook[0].subject
    addBookModalLabelDOM.textContent = "Kitabı güncelle"

}

showBooksUI = (books) => {
    currentBooks = books
    let result = ""
    books.forEach((book) => {
        result += `<div class="col-6 col-md-4 col-lg-2 mb-4 z-1">
                <div id="carousel-${book.id}" class="carousel shadow slide border rounded-4" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        <div class="carousel-item active position-relative">
                            <img class="img-fluid book-img rounded-4 d-block w-100" src="${book.imgUrl}" alt="...">
                            
                            <div class="overlay position-absolute w-100 h-100 bg-black top-0 rounded-4"></div>
                            <div class="buttons position-absolute d-flex">
                                <button onclick="editBook('${book.id}')" type="button" data-bs-target="#addBookModal" data-bs-toggle="modal" class="update-btn bg-transparent border-0">
                                    <i class="bi bi-pencil-square text-white fs-3"></i>
                                </button>
                                <button type="button" onclick="deleteBook('${book.id}')" class="bg-transparent border-0">
                                    <i class="bi bi-trash-fill text-white fs-3"></i>
                                </button>
                            </div>

                        </div>
                        <div class="carousel-item p-3">
                            <p><strong>Kitap adı: </strong>${book.bookName}</p>
                            <p><strong>Kategori: </strong>${book.category}</p>
                            <p><strong>Sayfa sayısı: </strong>${book.pageCount}</p>
                            <p><strong>Yazar: </strong>${book.author}</p>
                        </div>
                        <div class="carousel-item p-3 subject">
                            <span>${book.subject}</span>
                        </div>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${book.id}"
                        data-bs-slide="prev" data-bs-theme="dark">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carousel-${book.id}"
                        data-bs-slide="next" data-bs-theme="dark">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>`
    })
    booksAreaDOM.innerHTML = result
}
categorizeBook = (category) => {
    const categorizedBooks = books.filter(item => item.category == category)
    showBooksUI(categorizedBooks)

}
categoryDOMs.forEach((categoryDOM) => {
    categoryDOM.addEventListener('change', (event) => {
        categoryText = event.target.value
        categorizeBook(categoryText)
    })
})

getBook = async () => {
    try {
        const response = await fetch("http://localhost:3000/books")
        books = await response.json()
        showBooksUI(books)
    }
    catch (error) {
        console.log(error);

    }
}

getBook()