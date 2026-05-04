module.exports = (objectPagination,query,countProduct) => {
    if(query.page){
      objectPagination.currentPage =parseInt(query.page)
    }
    // console.log(objectPagination.currentPage)
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems
    // console.log(objectPagination) 
    const totalPage =Math.ceil(countProduct/objectPagination.limitItems)
    console.log(totalPage)
    objectPagination.totalPage = totalPage
    return objectPagination
}