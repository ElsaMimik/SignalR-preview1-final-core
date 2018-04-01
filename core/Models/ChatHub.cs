using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace core.Models
{
    public class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            //await Clients.All.SendAsync("SendMsg", $"{Context.ConnectionId} joined");
            await Clients.Caller.SendAsync("SendMsgConsole", $"you are joined");
            await Clients.Others.SendAsync("GetMsg", $"{Context.ConnectionId} joined");
        }
        public override async Task OnDisconnectedAsync(Exception ex)
        {
            //await Clients.All.SendAsync("SendMsg", $"{Context.ConnectionId} left");
            await Clients.Caller.SendAsync("SendMsgConsole", $"you are left");
            await Clients.Others.SendAsync("GetMsg", $"{Context.ConnectionId} left");
        }

        public async Task Send(string message)
        {
            await Clients.Caller.SendAsync("SendMsgConsole", $"you are send: {message}");
            await Clients.Others.SendAsync("GetMsg", $"{Context.ConnectionId}: {message}");
        }

        public async Task SendToSomeone(string receiverId, string message)
        {
            await Clients.Caller.SendAsync("SendMsgConsole", $"you @ {receiverId}: {message}");
            await Clients.Client(receiverId).SendAsync("GetMsg", $"{Context.ConnectionId}@{receiverId}: {message}");
        }

        public async Task SendToGroup(string groupName, string message)
        {
            //await Clients.Group(groupName).SendAsync("GetMsg", $"{Context.ConnectionId}@{groupName}: {message}");
            await Clients.Caller.SendAsync("SendMsgConsole", $"you @{groupName}: {message}");
            await Clients.OthersInGroup(groupName).SendAsync("GetMsg", $"{Context.ConnectionId}@{groupName}: {message}");
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("SendMsgConsole", $"you joined {groupName}");
            await Clients.OthersInGroup(groupName).SendAsync("GetMsg", $"{Context.ConnectionId} joined {groupName}");
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("SendMsgConsole", $"you left {groupName}");
            await Clients.OthersInGroup(groupName).SendAsync("GetMsg", $"{Context.ConnectionId} left {groupName}");
        }

        public async Task Echo(string message)
        {
            //return Clients.Client(Context.ConnectionId).SendAsync("GetMsg", $"{Context.ConnectionId}: {message}");
            await Clients.Caller.SendAsync("GetMsg", $"{message}");
        }
    }
}
