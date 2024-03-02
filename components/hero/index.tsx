import Image from "next/image";
import { RiScreenshotFill } from "react-icons/ri";

export default function Hero () {
    return (
<section className="overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
      <div className="relative z-10 mx-auto max-w-2xl lg:col-span-6 lg:max-w-none lg:pt-6 xl:col-span-6">
        <h1 className="text-4xl font-medium tracking-tight text-gray-900 flex items-center">
            <RiScreenshotFill className="mr-2"/>screenshot
        </h1>
        <p className="mt-6 text-lg text-gray-600">Convert any screenshot or design into code. You can directly drag an image to the website and wait for a few seconds to output the result. It supports multiple framework code outputs.</p>
        {/* <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex justify-center mt-2">
                <span className="bg-black text-teal-400 px-4 py-2 font-bold rounded-md">
                    git clone site-maker
                </span>
            </div>
        </div> */}
      </div>
      <div className="relative mt-10 sm:mt-20 lg:col-span-6 lg:row-span-2 lg:mt-0 xl:col-span-6">
        <div className="-mx-4 h-[448px] px-9 sm:mx-0 lg:absolute lg:-inset-x-10 lg:-bottom-20 lg:-top-10 lg:h-auto lg:px-0 lg:pt-10 xl:-bottom-32">
          <div className="relative aspect-[1648/1272] mx-auto max-w-[450px]">
            <Image alt="" height={1080} width={1080} src={'/screenshot.png'}/>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    );
}