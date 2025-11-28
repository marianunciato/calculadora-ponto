import React from 'react';

export default function Footer() {
    return (
        <div className='bg-white/70 backdrop-blur-lg dark:bg-slate-950/50 w-full py-3 flex justify-center border-t border-white/20 mt-4' style={{fontVariationSettings: "'FILL' 1"}}>
            <a href="[https://www.linkedin.com/in/marianunciato/](https://www.linkedin.com/in/marianunciato/)" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined dark:text-white hover:text-yellow-300 cursor-pointer text-black ">
                    star
                </span>
            </a>    
        </div>
    );
}