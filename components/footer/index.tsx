import Image from "next/image";

const Footer = () => {
    return (
        <footer className="bg-base-200 border-t">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className=" flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
            <div className="w-74 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
              <a aria-current="page" className="flex gap-2 justify-center md:justify-start items-center" href="/#">
                <Image alt="" src={'/logo.png'} width={30} height={30} />
                <strong className="font-semibold tracking-tight text-base md:text-lg">ancodeai</strong></a>
              <p className="mt-3 text-sm text-base-content-secondary">By using OpenAI technologies to generate code.</p>
              <p className="mt-3 text-sm text-base-content-secondary/80">© Copyright 2024 ancodeai. All rights reserved.</p></div>
            <div className="flex-grow flex flex-wrap md:pl-24 -mb-10 md:mt-0 mt-10 text-center">
                <div className="lg:w-1/3 md:w-1/2 w-full px-4">
                    <div className="footer-title font-medium text-base-content tracking-widest text-sm md:text-left mb-3">LEGAL</div>
                    <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                        <a className="link link-hover" href="/tos">Terms of services</a>
                        <a className="link link-hover" href="/privacy-policy">Privacy policy</a>
                    </div>
                </div>
                <div className="lg:w-1/3 md:w-1/2 w-full px-4">
                    <div className="footer-title font-medium text-base-content tracking-widest text-sm md:text-left mb-3">SOCIAL</div>
                    <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                        <a className="link link-hover" href="mailto:sparrowwht7@gmail.com">email</a>
                        <a target="_blank" rel="noopener" className="link link-hover" href="https://twitter.com/haitaowu18">
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                        </a>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </footer>
    );
}

export default Footer;