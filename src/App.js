import './App.css';
import React from 'react';
import CalculadoraDePonto from './calculadora';

const App = React.memo(() => {

    return (
        <div className="main__page flex justify-center items-center h-screen w-screen bg-slate-900">
            <CalculadoraDePonto/>
        </div>
    );
});

export default App;