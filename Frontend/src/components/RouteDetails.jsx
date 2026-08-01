function RouteDetails({ navigation }) {

    if (!navigation) {
        return null;
    }

    return (
        <div>

            <h2>Route Details</h2>

            <p>
                <strong>Distance:</strong> {navigation.distance} m
            </p>

            <h3>Path</h3>

            {
                navigation.path.map((checkpoint, index) => (
                    <div key={checkpoint}>
                        <p>{checkpoint}</p>

                        {
                            index !== navigation.path.length - 1 &&
                            <p>↓</p>
                        }
                    </div>
                ))
            }

        </div>
    );

}

export default RouteDetails;