const Panel = ({ children, title, action }: {
    children?: React.ReactNode,
    title?: React.ReactNode,
    action?: React.ReactNode

}) => {
    return (<div className="flex flex-col h-full ">
        <div className="flex-shrink header" style={{ height: "48px" }}>
            <div className="flex items-center logo ">
                {/* <img className="w-5 h-5 mr-2" src="chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/./assets/logo-OYJ34ERC.png" alt="sider logo" /> */}
                <span className="text-[20px] title-font">{title}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto ">
                {action}
            </div>
        </div>
        {children}
    </div>)
}

export default Panel