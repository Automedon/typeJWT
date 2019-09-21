import React, {useEffect, useState} from 'react';
import Routes from "./Routes";
import {setAccessToken} from "./accessToken";

interface Props {

}

const App: React.FC<Props> = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch('http://localhost:3005/refresh_token', {method: 'POST', credentials: 'include'}).then(async x => {
            const {accessToken} = await x.json();
            setAccessToken(accessToken);
            setLoading(false)
        })
    }, []);
    if (loading) {
        return <div>loading...</div>
    }
    return (
        <Routes/>
    );
};

export default App;
