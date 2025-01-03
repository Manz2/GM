# build with:
# docker build com/group/finance-backend .

FROM openjdk:21-jdk-slim
RUN adduser --system --group spring
USER spring:spring
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
