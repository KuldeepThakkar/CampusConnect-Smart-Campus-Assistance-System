function RouteDetails({ navigation }) {

    if (!navigation) {
        return null;
    }

    return (
        <div className="card">

            <div className="card-header">
                <h2>Route Details</h2>
                <span className={`badge ${navigation.insideCampus ? "badge-on-campus" : "badge-off-campus"}`}>
                    {navigation.insideCampus ? "On Campus" : "Off Campus"}
                </span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Distance</span>
                <span className="card-row-value mono">{navigation.distance} m</span>
            </div>

            <h3 className="route-path-heading">Path</h3>

            <div className="route-path">
                {
                    navigation.path.map((checkpoint) => (
                        <div key={checkpoint} className="route-step">
                            {checkpoint}
                        </div>
                    ))
                }
            </div>

        </div>
    );

}

export default RouteDetails;