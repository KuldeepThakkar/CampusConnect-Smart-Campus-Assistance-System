const navigationService = require("../services/navigation.service");
const {successResponse,errorResponse} = require("../utils/response");

async function navigate(req, res) {

    try {

        const result = await navigationService.navigate(req.body);

        if (!result.success) {
            return res.status(404).json(
                errorResponse(result.message)
            );
        }

        return res.status(200).json(
            successResponse(
                "Navigation successful",
                {
                    path: result.path,
                    distance: result.distance,
                    insideCampus: result.insideCampus,
                    offCampusPath: result.offCampusPath
                }
            )
        );

    } catch (error) {

        return res.status(500).json(
            errorResponse(error.message)
        );

    }

}

async function navigateToNextClass(req, res) {

    try {

        const result = await navigationService.navigateToNextClass(req.body);

        if (!result.success) {
            return res.status(404).json(
                errorResponse(result.message)
            );
        }

        return res.status(200).json(
            successResponse(
                "Navigation generated successfully",
                {
                    status: result.status,
                    day: result.day,
                    currentTime: result.currentTime,
                    lecture: result.lecture,
                    navigation: result.navigation
                }
            )
        );

    } catch (error) {

        return res.status(500).json(
            errorResponse(error.message)
        );

    }

}

module.exports = {
    navigate,
    navigateToNextClass
};