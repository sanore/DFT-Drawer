class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    mul(c) {
        const re = this.re * c.re - this.im * c.im;
        const im = this.im * c.re + this.re * c.im;

        this.re = re;
        this.im = im;
    }

    add(c) {
        this.re += c.re;
        this.im += c.im;
    }

    amp() {
        return sqrt(this.re*this.re + this.im*this.im);
    }

    phase() {
        return atan2(this.im, this.re);
    }
}

// Discrete Fourer Transformation: https://en.wikipedia.org/wiki/Discrete_Fourier_transform
// Param: x: Complex[]
// Ret:   freq, Complex[] 
function dft(x) {
    const dftValues = []
    const N = x.length;

    for (let k = 0; k < N; k++) {
        let val = new Complex(0, 0);
        for (let n = 0; n < N; n++) {    
            const phi = (TWO_PI * k * n) / N;

            let c = new Complex(cos(phi), -sin(phi));
            c.mul(x[n]);
            val.add(c);
        }

        let freq = k;
        val.re = val.re / N;
        val.im = val.im / N;

        dftValues[k] = { freq, val };
    }

    return dftValues;
}
