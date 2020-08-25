import socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

server_socket.bind(('192.168.0.15', 9090))

while True:
    data, addr = server_socket.recvfrom(1024)
    print(data.decode("utf-8"))
    print(addr)

