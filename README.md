# SignalR-preview1-final-core

1. 
##Microsoft.AspNetCore.SignalR

   Install-Package Microsoft.AspNetCore.SignalR -Version 1.0.0-preview1-final
    -- [link](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR)

2. 
##Microsoft.AspNetCore.SignalR.Client

   Install-Package Microsoft.AspNetCore.SignalR.Client -Version 1.0.0-preview1-final
   -- [link](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR.Client)

3. 
##npm install @aspnet/signalr
    -- [link](https://www.npmjs.com/package/@aspnet/signalr)

    get file from 
    C:\Windows\System32\node_modules\@aspnet\signalr\dist\browser\signalr.js

    3.1. 
    
    copy to wwwroot

     and use 
     <script src="js/signalr.js"></script> in html
     
    3.2
    
    Next, we need to register the required services in ConfigureServices:, before Use

    services.AddSignalR();
    We will be implementing a simple chat client, so, we will register a chat hub, in the Configure method:

    app.UseSignalR(routes =>
    {
        routes.MapHub<ChatHub>("chat");
    });
    A note: UseSignalR must be called before UseMvc!
