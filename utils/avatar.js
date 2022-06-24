const {models} = require("../sequelize/conn");

module.exports.deleteAvatar = async function deleteAvatar(user_id) {
    try {
        await models.avatar.destroy({
            where: {
                user_id: user_id
            }
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.uploadAvatar = async function uploadAvatar(user_id, image) {
    try {
        let avatar = await models.avatar.findOne({
            where: {
                user_id: user_id
            }
        });
        if (avatar) {
            await models.avatar.update({image: image}, {
                where: {
                    user_id: user_id
                }
            });
        } else {
            let newAvatar = {
                user_id: user_id,
                image: image
            }
            await models.avatar.create(newAvatar);
        }
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
