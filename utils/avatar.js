const {models} = require("../sequelize/conn");

// module.exports.deleteImage = async function deleteImage(room_id) {
//     try {
//         await models.image.destroy({
//             where: {
//                 room_id: room_id
//             }
//         });
//     } catch (err) {
//         console.error(err);
//         throw err;
//     }
// }

module.exports.createAvatar = async function createAvatar(user_id, image) {
    try {
        let newImage = {
            user_id: user_id,
            url: image
        }
        await models.avatar.create(newImage);
    } catch (err) {
        throw err;
    }
}

module.exports.getAvatar = async function getAvatar(user_id) {
    try {
        let avatar = await models.avatar.findOne({
            where: {
                user_id: user_id
            }
        });
        return avatar.image;
    } catch (err) {
        throw err;
    }
}
