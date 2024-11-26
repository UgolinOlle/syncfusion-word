FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ./api/src/EJ2APIServices_NET8.csproj ./src/
RUN dotnet restore ./src/EJ2APIServices_NET8.csproj

COPY ./api/ ./src/
WORKDIR /app/src
RUN dotnet publish ./EJ2APIServices_NET8.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV SYNCFUSION_LICENSE_KEY="Ngo9BigBOggjHTQxAR8/V1NDaF1cX2hIfEx3THxbf1x0ZFNMZVlbQHBPMyBoS35RckRiWHZednFcRmJeVUZ3"

ENTRYPOINT ["dotnet", "EJ2APIServices_NET8.dll"]
