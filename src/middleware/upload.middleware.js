import multer from "multer"

const upload = multer({
    dest: "storage/"
})

export default upload