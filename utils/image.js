const {models} = require("../sequelize/conn");

module.exports.deleteImage = async function deleteImage(room_id) {
    try {
        await models.image.destroy({
            where: {
                room_id: room_id
            }
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.createImage = async function createImage(room_id, images) {
    try {
        for (let imageUrl of images) {
            let newImage = {
                room_id: room_id,
                url: imageUrl
            }
            await models.image.create(newImage);
        }
    } catch (err) {
        throw err;
    }
}

module.exports.getImage = async function getImage(room_id) {
    try {
        let images = await models.image.findAll({
            where: {
                room_id: room_id
            }
        });
        return images.map(image => {
            return image.url;
        })
    } catch (err) {
        throw err;
    }
}
