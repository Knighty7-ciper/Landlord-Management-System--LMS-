package com.landlord.property.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaAuditing
@EnableMongoAuditing
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
public class AppConfig {

    @Value("${rabbitmq.queue.property-events:property-events}")
    private String propertyEventsQueue;

    @Value("${rabbitmq.queue.property-updates:property-updates}")
    private String propertyUpdatesQueue;

    @Bean
    public Queue propertyEventsQueue() {
        return new Queue(propertyEventsQueue, true);
    }

    @Bean
    public Queue propertyUpdatesQueue() {
        return new Queue(propertyUpdatesQueue, true);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter());
        return rabbitTemplate;
    }
}