
async function Fetching(frase, numero) {
    console.log('frase', frase, numero);
    // PONER LA IP EN .ENV Y EN VERCEL
    const res = await fetch(`${process.env.DIRECCION_IP}/send/vendedor/`,
        {
            method: "POST",
            // mode: "cors",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },// *GET, POST, PUT, DELETE, etc.
            // referrerPolicy: "no-referrer",
            body: JSON.stringify({ titulo: frase, numero })
        })
    //     console.log('res',res);

        // const res = await fetch('https://quarks-wha-sirsantana.vercel.app/',
        // {
        //     // method: "GET",
        //     // mode: "cors",
        //     headers: {
        //         "Content-Type": "application/json",
        //         // 'Content-Type': 'application/x-www-form-urlencoded',
        //     },// *GET, POST, PUT, DELETE, etc.
        //     // referrerPolicy: "no-referrer",
        //     // body: JSON.stringify({ titulo: frase, numero })
        // })
        console.log(res);

    }

module.exports = Fetching