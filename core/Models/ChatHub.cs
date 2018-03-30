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
            await Clients.All.SendAsync("Send", $"{Context.ConnectionId} joined");
        }
        public override async Task OnDisconnectedAsync(Exception ex)
        {
            await Clients.All.SendAsync("Send", $"{Context.ConnectionId} left");
        }

        public Task Send(string message) => Clients.All.SendAsync("Send", $"{Context.ConnectionId}: {message}");

        public Task SendToSomeone(string receiverId, string message) => Clients.Client(receiverId).SendAsync("Send", $"{Context.ConnectionId}@{receiverId}: {message}");

        public Task SendToGroup(string groupName, string message) => Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId}@{groupName}: {message}");

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddAsync(Context.ConnectionId, groupName);

            await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} joined {groupName}");
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveAsync(Context.ConnectionId, groupName);

            await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} left {groupName}");
        }

        public Task Echo(string message)
        {
            return Clients.Client(Context.ConnectionId).SendAsync("Send", $"{Context.ConnectionId}: {message}");
        }
    }
}
