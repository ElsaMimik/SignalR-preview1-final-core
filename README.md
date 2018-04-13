# SignalR-preview1-final-core

1. 
##Microsoft.AspNetCore.SignalR (required)

   Install-Package Microsoft.AspNetCore.SignalR -Version 1.0.0-preview1-final
    -- [link](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR)

2. 
##Microsoft.AspNetCore.SignalR.Client (unnecessary)

   Install-Package Microsoft.AspNetCore.SignalR.Client -Version 1.0.0-preview1-final
   -- [link](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR.Client)

3. 
##npm install @aspnet/signalr (required)
    -- [link](https://www.npmjs.com/package/@aspnet/signalr)

    get file from 
    C:\Windows\System32\node_modules\@aspnet\signalr\dist\browser\signalr.js


    3.1. 
    
    copy signalr.js to wwwroot/js 
     
    3.2
    
    Create Hub.cs file name "ChatHub" inherit Hub
    
    using Microsoft.AspNetCore.SignalR;
     
    3.3
    
    Next, we need to register the required services in ConfigureServices(Startup.cs):, before Use

    services.AddSignalR();
    We will be implementing a simple chat client, so, we will register a chat hub, in the Configure method:
   
    app.UseSignalR(routes =>
    {
        routes.MapHub<ChatHub>("/chathub");
    });
    A note: UseSignalR must be called before UseMvc!
    
    3.4
    
    Create html file and use 
    
    <script src="js/signalr.js"></script> in your html file
    
    
-- [SignalR Core Silde](https://docs.google.com/presentation/d/10feEVSSOssgkpHFQkvETy2eLjwGs391hzTUhkzWhJys/edit#slide=id.p)
