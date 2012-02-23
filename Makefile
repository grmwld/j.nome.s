NO_COLOR = \x1b[0m
GREEN = \x1b[32;01m
RED = \x1b[31;01m
YELLOW = \x1b[33;01m

BIN_SCRIPT = ./bin
TEST_DIR = ./test
TESTS = $(TEST_DIR)/*.js
TEST_MODELS = $(TEST_DIR)/*models.js
DEMO_DIR = $(TEST_DIR)/data
DEMO_REF_FASTA = $(DEMO_DIR)/"SacCer_chrI-II-III-IV.fasta"
DEMO_GENES_JFF = $(DEMO_DIR)/"SacCer_chrI-II-III-IV.genes.jff"
DEMO_PROFILE = $(DEMO_DIR)/"SRR002051_chrI-II-III-IV.profile"

DEMO_DB = "SacCer-demo"
DEMO_GENE_COL = "ensembl_genes"
DEMO_COL_PROFILE = "rnaseq"
REPORTER = "spec"


test: remove-demo install-demo test-models remove-demo
	@NODE_ENV=test 	./node_modules/.bin/mocha \
		--reporter $(REPORTER)

test-models:
	@NODE_ENV=test 	./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 10000 \
		--slow 1000 \
		$(TEST_MODELS)


install-demo:
	@ echo "$(YELLOW)Installing demo data$(NO_COLOR)" \
		&& echo "Unpacking demo data ..." \
		&& tar xvf $(DEMO_DIR).tar.bz2 -C $(TEST_DIR) \
		&& echo "Loading reference ..." \
		&& $(BIN_SCRIPT)/load_fasta_reference.py \
			-i $(DEMO_REF_FASTA) \
			-d $(DEMO_DB) \
			--drop \
		&& echo "Loading annotation ..." \
		&& mongoimport \
			-d $(DEMO_DB) \
			-c $(DEMO_GENE_COL) \
			--file $(DEMO_GENES_JFF) \
			--drop \
			--stopOnError \
		&& $(BIN_SCRIPT)/load_bed_profile.py \
			-i $(DEMO_PROFILE) \
			-d $(DEMO_DB) \
			-c $(DEMO_COL_PROFILE) \
			--drop \
		&& echo "Repacking demo data ..." \
		&& tar cvjf data.tar.bz2 -C $(TEST_DIR) data \
		&& rm -r $(DEMO_DIR) \
		&& echo "$(GREEN)DONE$(NO_COLOR)"

remove-demo:
	@ echo "$(YELLOW)Uninstalling demo data$(NO_COLOR)" \
		&& mongo $(DEMO_DB) \
			--eval "db.dropDatabase()" \
			--quiet \
		&& echo "$(GREEN)DONE$(NO_COLOR)"


.PHONY: test test-models install-demo remove-demo
