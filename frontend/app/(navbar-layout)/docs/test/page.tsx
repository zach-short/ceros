export default function Demo() {
    return (
    <div className="flex flex-col">
        <div className="h-[80vh] border-2 border-solid border-black bg-gray-200 p-4 text-black pt-8 text-center">
            <img src="/images/logo.png" alt="Meeting GIF" className="mx-auto"/>
            <div className="text-8xl font-semibold">Ceros</div>
            <div className="text-4xl font-medium">The chat-based solution for RONR meetings</div>
            <div className="flex justify-center items-center mt-8">
                <button className="mr-8 text-2xl">Get Started</button>
                <button className="ml-8 text-2xl">Documentation</button>
            </div>
        </div>
        <div className="min-h-screen border-2 border-solid border-black bg-gray-200 p-4 text-black pt-8 text-center">Content Box 2</div>
        <div className="min-h-screen border-2 border-solid border-black bg-gray-200 p-4 text-black pt-8 text-center">Content Box 3</div>
        <div className="min-h-screen border-2 border-solid border-black bg-gray-200 p-4 text-black pt-8 text-center">Content Box 1</div>
        <div className="min-h-screen border-2 border-solid border-black bg-gray-200 p-4 text-black pt-8 text-center">Content Box 4</div>
    </div>)
}