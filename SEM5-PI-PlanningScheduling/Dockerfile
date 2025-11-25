
FROM mcr.microsoft.com/dotnet/sdk:latest AS build
WORKDIR /src

COPY . .

RUN dotnet publish SEM5-PI-PlanningScheduling.csproj -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:latest AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "SEM5-PI-PlanningScheduling.dll"]