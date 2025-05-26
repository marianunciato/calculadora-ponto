import React from 'react';
import Calculadora from './calculadora';

const App = React.memo(() => {

    return (
        <div className="flex justify-center items-center h-screen w-screen bg-slate-900">
            <Calculadora/>
        </div>
    );
});

export default App;