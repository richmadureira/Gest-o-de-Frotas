# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["GestaoFrotas.sln", "./"]
COPY ["src/GestaoFrotas.API/GestaoFrotas.API.csproj", "src/GestaoFrotas.API/"]
COPY ["src/GestaoFrotas.Application/GestaoFrotas.Application.csproj", "src/GestaoFrotas.Application/"]
COPY ["src/GestaoFrotas.Domain/GestaoFrotas.Domain.csproj", "src/GestaoFrotas.Domain/"]
COPY ["src/GestaoFrotas.Infrastructure/GestaoFrotas.Infrastructure.csproj", "src/GestaoFrotas.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "GestaoFrotas.sln"

# Copy all source code
COPY . .

# Build
WORKDIR "/src/src/GestaoFrotas.API"
RUN dotnet build "GestaoFrotas.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "GestaoFrotas.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy published files
COPY --from=publish /app/publish .

# Expose port
EXPOSE 80
EXPOSE 443

# Set entry point
ENTRYPOINT ["dotnet", "GestaoFrotas.API.dll"]

