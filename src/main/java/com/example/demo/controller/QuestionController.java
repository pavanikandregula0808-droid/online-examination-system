package com.example.demo.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Option;
import com.example.demo.entity.Question;
import com.example.demo.repository.OptionRepository;
import com.example.demo.repository.QuestionRepository;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    private QuestionRepository questionRepository;
    private OptionRepository optionRepository;

    public QuestionController(QuestionRepository questionRepository,
                               OptionRepository optionRepository) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
    }

    @GetMapping
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Question getQuestionById(@PathVariable Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Question createQuestion(@RequestBody Question question) {
        return questionRepository.save(question);
    }

    @PutMapping("/{id}")
    public Question updateQuestion(@PathVariable Long id,
                                   @RequestBody Question question) {
        question.setId(id);
        return questionRepository.save(question);
    }

    @DeleteMapping("/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
        return "Question deleted successfully";
    }

    @GetMapping("/random/{count}")
    public List<Question> getRandomQuestions(@PathVariable int count) {

        List<Question> questions = new ArrayList<>(questionRepository.findAll());

        Collections.shuffle(questions);

        return questions.stream()
                .limit(count)
                .toList();
    }

    @GetMapping("/paper/{count}")
    public List<Map<String, Object>> generateQuestionPaper(
            @PathVariable int count) {

        // Get all questions
        List<Question> questions = questionRepository.findAll();

        // Select fixed questions based on ID
        List<Question> selectedQuestions = questions.stream()
                .sorted((q1, q2) -> q1.getId().compareTo(q2.getId()))
                .limit(count)
                .toList();

        // Create a mutable list so that we can shuffle the order
        List<Question> shuffledQuestions =
                new ArrayList<>(selectedQuestions);

        // Shuffle only the order
        Collections.shuffle(shuffledQuestions);

        return shuffledQuestions.stream()
                .map(question -> {

                    // Get options belonging to this question
                    List<Option> options =
                            new ArrayList<>(
                                    optionRepository.findByQuestionId(
                                            question.getId()));

                    // Shuffle option order
                    Collections.shuffle(options);

                    Map<String, Object> questionPaper =
                            new HashMap<>();

                    questionPaper.put(
                            "questionId",
                            question.getId());

                    questionPaper.put(
                            "questionText",
                            question.getQuestionText());

                    questionPaper.put(
                            "questionType",
                            question.getQuestionType());

                    questionPaper.put(
                            "options",
                            options);

                    return questionPaper;
                })
                .toList();
    }
}