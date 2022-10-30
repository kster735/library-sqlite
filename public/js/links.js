const links=[
    document.getElementById('books'),
    document.getElementById('addbookform'),
    document.getElementById('about')
]

links.forEach( (elem) =>{
    const url = location.href.toString().split('/')[3]
    
    if (elem.getAttribute('id') === url){
        elem.classList.add('active')
    } else {
        if (elem.classList.contains('active')){
            elem.classList.remove('active')
        }
    }
    
})
