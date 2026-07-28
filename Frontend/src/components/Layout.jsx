import { Outlet } from "react-router-dom";


function Layout(){

    return (

        <div>

            <header>
                <h1>
                    Class Locator
                </h1>
            </header>


            <main>
                <Outlet />
            </main>


        </div>

    )

}


export default Layout;