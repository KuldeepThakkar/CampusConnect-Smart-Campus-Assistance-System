const navigationService = require("../services/navigation.service");

function navigate(req, res) {

    const result = navigationService.navigate(req.body);

    res.status(200).json(result);

}

function navigateToNextClass(req, res) {

    const result = navigationService.navigateToNextClass(req.body);

    res.status(200).json(result);

}

module.exports = {
    navigate,
    navigateToNextClass
};