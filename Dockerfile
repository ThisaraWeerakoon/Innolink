FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage uses Temurin JRE (Debian-based) to support ONNX Runtime (requires glibc/libstdc++)
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the built jar (assumes a single jar artifact). Adjust the pattern if multiple jars are produced.
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]