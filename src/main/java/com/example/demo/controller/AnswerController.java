package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Answer;
import com.example.demo.entity.Option;
import com.example.demo.entity.Question;
import com.example.demo.repository.AnswerRepository;
import com.example.demo.repository.OptionRepository;
import com.example.demo.repository.QuestionRepository;

@RestController
@RequestMapping("/answers")
public class AnswerController {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;

    public AnswerController(
            AnswerRepository answerRepository,
            QuestionRepository questionRepository,
            OptionRepository optionRepository) {

        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
    }

    @PostMapping
    public Answer saveAnswer(@RequestBody Answer answer) {
        return answerRepository.save(answer);
    }

    @GetMapping
    public List<Answer> getAllAnswers() {
        return answerRepository.findAll();
    }

    @PutMapping("/{id}")
    public Answer updateAnswer(
            @PathVariable Long id,
            @RequestBody Answer answer) {

        Answer existingAnswer = answerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Answer not found"));

        existingAnswer.setOptionId(answer.getOptionId());
        existingAnswer.setQuestionId(answer.getQuestionId());
        existingAnswer.setStudentId(answer.getStudentId());

        return answerRepository.save(existingAnswer);
    }

    @PostMapping("/result")
    public Map<String, Object> calculateResult(
            @RequestBody Map<String, Long> request) {

        Long studentId = request.get("studentId");

        List<Answer> answers = answerRepository.findAll();

        int totalQuestions = 0;
        int answeredQuestions = 0;
        int correctAnswers = 0;
        int wrongAnswers = 0;

        for (Answer answer : answers) {

            if (answer.getStudentId().equals(studentId)) {

                totalQuestions++;

                if (answer.getOptionId() != null) {

                    answeredQuestions++;

                    Question question = questionRepository
                            .findById(answer.getQuestionId())
                            .orElse(null);

                    Option option = optionRepository
                            .findById(answer.getOptionId())
                            .orElse(null);

                    if (question != null && option != null
                            && question.getCorrectOption() != null
                            && option.getOptionLabel() != null
                            && question.getCorrectOption().trim()
                                    .equalsIgnoreCase(
                                            option.getOptionLabel().trim())) {

                        correctAnswers++;

                    } else {
                        wrongAnswers++;
                    }
                }
            }
        }

        int score = correctAnswers;

        double percentage = 0;

        if (totalQuestions > 0) {
            percentage = (correctAnswers * 100.0) / totalQuestions;
        }

        Map<String, Object> result = new HashMap<>();

        result.put("studentId", studentId);
        result.put("totalQuestions", totalQuestions);
        result.put("answeredQuestions", answeredQuestions);
        result.put("correctAnswers", correctAnswers);
        result.put("wrongAnswers", wrongAnswers);
        result.put("score", score);
        result.put("percentage", percentage);

        return result;
    }
}